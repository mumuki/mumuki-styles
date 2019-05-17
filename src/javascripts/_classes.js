mumuki.load(function () {

  function regexMatchAll(regex, string, callback) {
    const matches = string.match(RegExp(regex, 'g')) || [];
    matches.forEach(function (match) {
      callback(match.match(regex));
    });
  }

  function mapEntities(code) {
    entities = [];
    regexMatchAll(/class\s+([A-Z][a-zA-Z0-9_!?$]+).*?\{([\s\S]*?)\}/, code, function (classMatch) {
      const classBody = classMatch[2];
      const aClass = {
        name: '',
        methods: [] ,
        variables: [],
      }
      aClass.name = classMatch[1];
      regexMatchAll(/var\s+([a-z][a-zA-Z0-9_!?$]+)\s*:\s*([A-Z][a-zA-Z0-9_!?$]+)/, classBody, function (variableMatch) {
        aClass.variables.push({
          name: variableMatch[1],
          type: variableMatch[2],
        })
      });
      regexMatchAll(/def\s+([a-z][a-zA-Z0-9_!?$]+)\((.*?)\)\s*:\s*(.*)/, classBody, function (methodMatch) {
        const method = {
          name: methodMatch[1],
          return: methodMatch[3],
          params: [],
        }
        regexMatchAll(/([a-zA-Z0-9_?!$]*?)\s*:\s*([a-zA-Z0-9_?!$]*?\b)(,|\s|$)/, methodMatch[2], function (methodParamMatch) {
          method.params.push({
            name: methodParamMatch[1],
            type: methodParamMatch[2],
          })
        });
        aClass.methods.push(method);
      });
      entities.push(aClass);
    });
    return entities;
  }

  $.fn.renderClasses = function () {
    const self = this;
    self.empty();
    self.each(function (i) {
      //Don't draw if hidden
      if ((self[i].offsetParent === null)) return;

      const $diagram = $(self[i]);

      const entities = mapEntities($diagram.data('code'));
      // appendEntities($diagram, entities, i);
      // appendConnectors($diagram, entities, i);
    });
    return self;
  };

  mumuki.resize(function () {
    $('.mu-classes').renderClasses();
  });

});
