mumuki.load(function () {

  const OBJECT = 'Object';

  function regexMatchAll(regex, string='', callback) {
    const matches = string.match(RegExp(regex, 'g')) || [];
    matches.forEach(function (match) {
      callback(match.match(regex).groups);
    });
  }

  function mapClasses(entities, code) {
    regexMatchAll(/(?<kind>(abstract\s+)?class)\s+(?<name>[A-Z][a-zA-Z0-9_!?$]+)\s*(?:extends)?\s*(?<parent>[A-Z][a-zA-Z0-9_!?$]+)?\s*(?:implements)?\s*(?<parents>.*)?\s*\{(?<body>[\s\S]*?)\}/, code, function (classGroups) {
      const aClass = {
        type: classGroups.kind.split(/\s+/)[0],
        name: classGroups.name,
        parent: classGroups.parent || OBJECT,
        parents: [],
        methods: [] ,
        variables: [],
      }
      parseParents(aClass, classGroups.parents);
      parseVariables(aClass, classGroups.body)
      parseMethods(aClass, classGroups.body);
      entities.push(aClass);
    });
  }

  function mapInterfaces(entities, code) {
    regexMatchAll(/interface\s+(?<name>[A-Z][a-zA-Z0-9_!?$]+)\s*(?:extends)?\s*(?<parents>.*)?\s*\{(?<body>[\s\S]*?)\}/, code, function (interfaceGroups) {
      const anInterface = {
        type: 'interface',
        name: interfaceGroups.name,
        parent: OBJECT,
        parents: [],
        methods: [] ,
        variables: [],
      };
      parseParents(anInterface, interfaceGroups.parents);
      parseMethods(anInterface, interfaceGroups.body);
      entities.push(anInterface);
    });
  }

  function parseParents(obj, parents) {
    regexMatchAll(/(?<name>[A-Z][a-zA-Z0-9_?!$]*?)(?:,\s*|\s*|$)/, parents, function (parentsGroup) {
      obj.parents.push(parentsGroup.name)
    });
  }


  function parseVariables(obj, body) {
    regexMatchAll(/var\s+(?<name>[a-z][a-zA-Z0-9_!?$]+)\s*:\s*(?<type>[a-zA-Z0-9_!?$<>]+)/, body, function (varGroups) {
      obj.variables.push({
        name: varGroups.name,
        type: varGroups.type,
      })
    });
  }


  function parseMethods(obj, body) {
    regexMatchAll(/def\s+(?<name>[a-z][a-zA-Z0-9_!?$]+)\((?<params>.*?)\)\s*:\s*(?<return>.*)/, body, function (methodGroup) {
      const method = {
        name: methodGroup.name,
        return: methodGroup.return,
        params: [],
      }
      regexMatchAll(/(?<name>[a-zA-Z0-9_?!$]*?)\s*:\s*(?<type>[a-zA-Z0-9_?!$<>]*?\b)(?:,|\s|$)/, methodGroup.params, function (paramsGroup) {
        method.params.push({
          name: paramsGroup.name,
          type: paramsGroup.type,
        })
      });
      obj.methods.push(method);
    });
  }

  function mapEntities(code) {
    entities = [];
    mapClasses(entities, code);
    mapInterfaces(entities, code);
    return entities;
  }

  $.fn.renderClasses = function () {
    const self = this;
    self.empty();
    self.each(function (i) {
      //Don't draw if hidden
      if ((self[i].offsetParent === null)) return;
      var id = `mu-classes-diagram-${i}`
      const $diagram = $(self[i]);
      $diagram.attr('id', id);
      $diagram.height(600);
      init(mapEntities($diagram.data('code')), id);

    });
    return self;
  };


  function init(entities, id) {

    var $ = go.GraphObject.make;

    var myDiagram =
      $(go.Diagram, id, {
        layout: $(go.TreeLayout, { // this only lays out in trees nodes connected by "generalization" links
          angle: 90,
          path: go.TreeLayout.PathSource,  // links go from child to parent
          setsPortSpot: false,  // keep Spot.AllSides for link connection spot
          setsChildPortSpot: false,  // keep Spot.AllSides
          // nodes not connected by "generalization" links are laid out horizontally
          arrangement: go.TreeLayout.ArrangementHorizontal
        })
      });
    // show visibility or access as a single character at the beginning of each property or method
    function convertVisibility(v) {
      switch (v) {
        case "public": return "+";
        case "private": return "-";
        case "protected": return "#";
        case "package": return "~";
        default: return v;
      }
    }
    // the item template for properties
    var propertyTemplate =
      $(go.Panel, "Horizontal",
        // property visibility/access
        $(go.TextBlock,
          { isMultiline: false, editable: false, width: 12 },
          new go.Binding("text", "visibility", convertVisibility)),
        // property name, underlined if scope=="class" to indicate static property
        $(go.TextBlock,
          { isMultiline: false, editable: true },
          new go.Binding("text", "name").makeTwoWay(),
          new go.Binding("isUnderline", "scope", function(s) { return s[0] === 'c' })),
        // property type, if known
        $(go.TextBlock, "",
          new go.Binding("text", "type", function(t) { return (t ? ": " : ""); })),
        $(go.TextBlock,
          { isMultiline: false, editable: true },
          new go.Binding("text", "type").makeTwoWay()),
        // property default value, if any
        $(go.TextBlock,
          { isMultiline: false, editable: false },
          new go.Binding("text", "default", function(s) { return s ? " = " + s : ""; }))
      );
    // the item template for methods
    var methodTemplate =
      $(go.Panel, "Horizontal",
        // method visibility/access
        $(go.TextBlock,
          { isMultiline: false, editable: false, width: 12 },
          new go.Binding("text", "visibility", convertVisibility)),
        // method name, underlined if scope=="class" to indicate static method
        $(go.TextBlock,
          { isMultiline: false, editable: true },
          new go.Binding("text", "name").makeTwoWay(),
          new go.Binding("isUnderline", "scope", function(s) { return s[0] === 'c' })),
        // method parameters
        $(go.TextBlock, "()",
          // this does not permit adding/editing/removing of parameters via inplace edits
          new go.Binding("text", "parameters", function(parr) {
            var s = "(";
            for (var i = 0; i < parr.length; i++) {
              var param = parr[i];
              if (i > 0) s += ", ";
              s += param.name + ": " + param.type;
            }
            return s + ")";
          })),
        // method return type, if any
        $(go.TextBlock, "",
          new go.Binding("text", "type", function(t) { return (t ? ": " : ""); })),
        $(go.TextBlock,
          { isMultiline: false, editable: true },
          new go.Binding("text", "type").makeTwoWay())
      );
    // this simple template does not have any buttons to permit adding or
    // removing properties or methods, but it could!
    myDiagram.nodeTemplate =
      $(go.Node, "Auto",
        {
          locationSpot: go.Spot.Center,
          fromSpot: go.Spot.AllSides,
          toSpot: go.Spot.AllSides
        },
        $(go.Shape, { fill: "lightyellow" }),
        $(go.Panel, "Table",
          { defaultRowSeparatorStroke: "black" },
          // header
          $(go.TextBlock,
            {
              row: 0, columnSpan: 2, margin: 3, alignment: go.Spot.Center,
              font: "bold 12pt sans-serif",
              isMultiline: false, editable: true
            },
            new go.Binding("text", "name").makeTwoWay()),
          // properties
          $(go.TextBlock, "Properties",
            { row: 1, font: "italic 10pt sans-serif" },
            new go.Binding("visible", "visible", function(v) { return !v; }).ofObject("PROPERTIES")),
          $(go.Panel, "Vertical", { name: "PROPERTIES" },
            new go.Binding("itemArray", "properties"),
            {
              row: 1, margin: 3, stretch: go.GraphObject.Fill,
              defaultAlignment: go.Spot.Left, background: "lightyellow",
              itemTemplate: propertyTemplate
            }
          ),
          $("PanelExpanderButton", "PROPERTIES",
            { row: 1, column: 1, alignment: go.Spot.TopRight, visible: false },
            new go.Binding("visible", "properties", function(arr) { return arr.length > 0; })),
          // methods
          $(go.TextBlock, "Methods",
            { row: 2, font: "italic 10pt sans-serif" },
            new go.Binding("visible", "visible", function(v) { return !v; }).ofObject("METHODS")),
          $(go.Panel, "Vertical", { name: "METHODS" },
            new go.Binding("itemArray", "methods"),
            {
              row: 2, margin: 3, stretch: go.GraphObject.Fill,
              defaultAlignment: go.Spot.Left, background: "lightyellow",
              itemTemplate: methodTemplate
            }
          ),
          $("PanelExpanderButton", "METHODS",
            { row: 2, column: 1, alignment: go.Spot.TopRight, visible: false },
            new go.Binding("visible", "methods", function(arr) { return arr.length > 0; }))
        )
      );
    function convertIsTreeLink(r) {
      return r === "generalization";
    }
    function convertFromArrow(r) {
      switch (r) {
        case "generalization": return "";
        default: return "";
      }
    }
    function convertToArrow(r) {
      switch (r) {
        case "generalization": return "Triangle";
        case "knowledge": return "OpenTriangle";
        default: return "";
      }
    }
    myDiagram.linkTemplate =
      $(go.Link,
        { routing: go.Link.Orthogonal },
        new go.Binding("isLayoutPositioned", "relationship", convertIsTreeLink),
        $(go.Shape),
        $(go.Shape, { scale: 1.3, fill: "white" },
          new go.Binding("fromArrow", "relationship", convertFromArrow)),
        $(go.Shape, { scale: 1.3, fill: "white" },
          new go.Binding("toArrow", "relationship", convertToArrow))
      );
    // setup a few example class nodes and relationships

    var nodedata = entities.map((entity, i) => {
      return {
        key: i,
        name: entity.name,
        properties: entity.variables.map(toProperty),
        methods: entity.methods.map(toMethod)
      }
    });

    var linkdata = []

    entities.forEach((entity, i) => {
      var knowledges = entity.variables.map((variable) => {
        var type = nodedata.find((node) => variable.type.indexOf(node.name) >= 0);
        return type && { from: i, to: type.key, relationship: 'knowledge' }
      })
      .filter((link) => {
        return !!link;
      })
      linkdata = linkdata.concat(knowledges);
      var parent = nodedata.find((node) => entity.parent.indexOf(node.name) >= 0);
      linkdata = linkdata.concat(!parent ? [] : { from: i, to: parent.key, relationship: 'generalization' });
    });

    console.log('enti:', entities);
    console.log('node:', nodedata);
    var options = {
      copiesArrays: true,
      copiesArrayObjects: true,
      nodeDataArray: nodedata,
      linkDataArray: linkdata
    }

    myDiagram.model = $(go.GraphLinksModel, options);

    function toMethod(method) {
      return {
        name: method.name,
        parameters: method.params,
        visibility: "public"
      }
    }

    function toProperty(property) {
      return {
        name: property.name,
        type: property.type,
        visibility: "public"
      }
    }

  }

  $('.mu-classes').renderClasses();

});
