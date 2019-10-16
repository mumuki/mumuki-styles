mumuki.load(function () {

  const OBJECT = 'Object';

  function regexMatchAll(regex, string='', callback) {
    const matches = string.match(RegExp(regex, 'g')) || [];
    return matches.map(function (match) {
      return callback(match.match(regex).groups);
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
      if (method.params.length > 0) {
        method.params.forEach(param => param.last = ',')
        method.params[method.params.length - 1].last = ')';
      }
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
      renderClassDiagram($diagram, id);

    });
    return self;
  };


  function renderClassDiagram($diagram, id) {

    var code = $diagram.data('code');
    var showReturn = $diagram.data('show-return');
    var showVarTypes = $diagram.data('show-var-types');
    var showEntityKind = $diagram.data('show-entity-kind');

    var entities = mapEntities(code);
    var toRemove;

    var borderColor = colorFromCssProperty('mu-classes-entity', 'border-color');
    var borderWidth = pxFromCssProperty('mu-classes-entity', 'border-width');
    var bgColor = colorFromCssProperty('mu-classes-entity-attributes', 'background-color');
    var nameBgColor = colorFromCssProperty('mu-classes-entity-name', 'background-color');
    var typeFontColor = colorFromCssProperty('mu-classes-type', 'color');
    var margin = pxFromCssProperty('mu-classes-entity', 'margin') / 2 - 2;
    var font = getFromCssProperty('mu-classes-entity', 'font-size') + ' ' + getFromCssProperty('mu-classes-entity', 'font-family');
    var textColor = colorFromCssProperty('mu-classes-entity', 'color');

    var $$ = go.GraphObject.make;

    var classDiagram = $$(go.Diagram, id, {
      layout: $$(go.TreeLayout, { // this only lays out in trees nodes connected by 'generalization' links
        angle: 90,
        path: go.TreeLayout.PathSource,  // links go from child to parent
        setsPortSpot: false,  // keep Spot.AllSides for link connection spot
        setsChildPortSpot: false,  // keep Spot.AllSides
        // nodes not connected by 'generalization' links are laid out horizontally
        arrangement: go.TreeLayout.ArrangementHorizontal
      })
    });

    var propertyTemplate = $$(go.Panel, 'Horizontal', { margin: margin }, ...[
      showVarTypes && $$(go.TextBlock, textOptions({ stroke: typeFontColor, font: `bold ${font}` }), new go.Binding('text', 'type')),
      showVarTypes && $$(go.TextBlock, { width: 5 }),
      $$(go.TextBlock, textOptions(), new go.Binding('text', 'name')),
    ].filter(e => e));

    var parameterTemplate = $$(go.Panel, 'Horizontal', ...[
      showVarTypes && $$(go.TextBlock, textOptions({ stroke: typeFontColor, font: `bold ${font}` }), new go.Binding('text', 'type')),
      showVarTypes && $$(go.TextBlock, { width: 5 }),
      $$(go.TextBlock, textOptions(), new go.Binding('text', 'name')),
      $$(go.TextBlock, textOptions(), new go.Binding('text', 'last')),
    ].filter(e => e));

    var methodTemplate = $$(go.Panel, 'Horizontal', { margin: margin }, ...[
      showReturn && $$(go.TextBlock, textOptions({ stroke: typeFontColor, font: `bold ${font}` }), new go.Binding('text', 'return')),
      showReturn && $$(go.TextBlock, { width: 5 }),
      $$(go.TextBlock, textOptions(), new go.Binding('text', 'name')),
      $$(go.TextBlock, textOptions(), '('),
      $$(go.Panel, 'Horizontal', { name: 'PARAMETERS' }, new go.Binding('itemArray', 'parameters'), {
        stretch: go.GraphObject.Fill,
        defaultAlignment: go.Spot.Left,
        background: bgColor,
        itemTemplate: parameterTemplate,
      }),
    ]);

    classDiagram.nodeTemplate = $$(go.Node, 'Auto', { locationSpot: go.Spot.Center, fromSpot: go.Spot.AllSides, toSpot: go.Spot.AllSides, }, ...[
      $$(go.Shape, 'RoundedRectangle', { fill: nameBgColor, stroke: borderColor, strokeWidth: borderWidth }),
      $$(go.Panel, 'Table', { defaultRowSeparatorStroke: borderColor, defaultRowSeparatorStrokeWidth: borderWidth }, ...[
        $$(go.TextBlock, textOptions({ name: 'HEADER', row: 0, margin: margin, alignment: go.Spot.Center }), new go.Binding('text', 'name')),
        $$(go.Panel, 'Vertical', { name: 'PROPERTIES' }, new go.Binding('itemArray', 'properties'), {
          row: 1,
          stretch: go.GraphObject.Fill,
          defaultAlignment: go.Spot.Left,
          background: bgColor,
          itemTemplate: propertyTemplate
        }),
        $$(go.Panel, 'Vertical', { name: 'METHODS' }, new go.Binding('itemArray', 'methods'), {
            row: 2,
            stretch: go.GraphObject.Fill,
            defaultAlignment: go.Spot.Left,
            background: bgColor,
            itemTemplate: methodTemplate
          }
        )
      ])
    ]);


    function convertIsTreeLink(r) {
      return r === 'generalization';
    }
    function convertFromArrow(r) {
      switch (r) {
        case 'generalization': return '';
        default: return '';
      }
    }
    function convertToArrow(r) {
      switch (r) {
        case 'generalization': return 'Triangle';
        case 'knowledge': return 'OpenTriangle';
        default: return '';
      }
    }
    classDiagram.linkTemplate =
      $$(go.Link, { routing: go.Link.Orthogonal }, new go.Binding('isLayoutPositioned', 'relationship', convertIsTreeLink),
        $$(go.Shape),
        $$(go.Shape, { scale: 1.5, fill: 'white' }, new go.Binding('fromArrow', 'relationship', convertFromArrow)),
        $$(go.Shape, { scale: 1.5, fill: 'white' }, new go.Binding('toArrow', 'relationship', convertToArrow))
      );

    var nodedata = entities.map((entity, i) => {
      return {
        key: i,
        name: entity.name,
        properties: entity.variables,
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

    var options = {
      copiesArrays: true,
      copiesArrayObjects: true,
      nodeDataArray: nodedata,
      linkDataArray: linkdata
    }

    classDiagram.model = $$(go.GraphLinksModel, options);

    function toMethod(method) {
      return {
        name: method.name,
        return: method.return,
        parameters: method.params,
      }
    }

    function getFromCssProperty(cssClass, property, callback=((a) => a)) {
      toRemove = $('<div>', { class: cssClass });
      $('body').append(toRemove);
      var _prop = callback(toRemove.css(property));
      toRemove.remove();
      return _prop;
    }

    function textOptions(hash = {}) {
      return Object.assign({}, { isMultiline: false, editable: false, font: font, stroke: textColor }, hash);
    }

    function pxFromCssProperty(cssClass, property) {
      return getFromCssProperty(cssClass, property, (p) => parseInt(p, 10));
    }

    function colorFromCssProperty(cssClass, property) {
      return getFromCssProperty(cssClass, property, color);
    }

    function color(string) {
      return string.startsWith('rgb')? rgbToHex(string) : string;
    }

    function rgbToHex(string) {
      return `#${regexMatchAll(/(?<digit>\d+)/, string, (match) => ['0'].concat(parseInt(match.digit, 10).toString(16).split('')).slice(-2).join('')).join('')}`;
    }
  }

  $('.mu-classes').renderClasses();

});
