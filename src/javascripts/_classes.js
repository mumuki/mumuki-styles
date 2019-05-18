mumuki.load(function () {

  function regexMatchAll(regex, string, callback) {
    const matches = string.match(RegExp(regex, 'g')) || [];
    matches.forEach(function (match) {
      callback(match.match(regex));
    });
  }

  function mapEntities(code) {
    entities = [];
    regexMatchAll(/(abstract\s+class|class|interface)\s+([A-Z][a-zA-Z0-9_!?$]+).*?\{([\s\S]*?)\}/, code, function (classMatch) {
      const classBody = classMatch[3];
      const aClass = {
        type: classMatch[1].split(/\s+/)[0],
        name: classMatch[2],
        methods: [] ,
        variables: [],
      }
      regexMatchAll(/var\s+([a-z][a-zA-Z0-9_!?$]+)\s*:\s*([a-zA-Z0-9_!?$]+)/, classBody, function (variableMatch) {
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

  function lowercased(string) {
    return string.toLowerCase().replace(/[_]/g, '-')
  }

  function entityID(entity, index) {
    return 'mu-classes-' + index + '-' + lowercased(entity);
  }

  function variableID(entity, variable, index) {
    return entityID(entity, index) + '-' + lowercased(variable);
  }

  function messageID(entity, message, index) {
    return entityID(entity, index) + '-' + lowercased(message);
  }

  function paramID(entity, message, param, index, i) {
    return messageID (entity, message, index) + '-' + i + '-' + lowercased(param);
  }

  function generateEntityAttributes(entity, index) {
    let html = '';
    entity.variables.forEach(function (variable) {
      html += [
        '<li id="', variableID(entity.name, variable.name, index), '" class="mu-classes-entity-attribute">',
        '  <span class="mu-classes-entity-attribute-name">',
        '    <span class="mu-classes-type">', variable.type, '</span>',
        '    <span>', variable.name, '</span>',
        '  </span>',
        '</li>'
      ].join('');
    });
    return html;
  }

  function generateParams(entity, message, index) {
    return message.params.map(function (param, i) {
      return [
        '<span id="', paramID(entity.name, message.name, param.name, index, i), '" class="mu-classes-entity-message-param">',
        '  <span class="mu-classes-type">', param.type, '</span>',
        '  <span class="mu-classes-param">', param.name, '</span>',
        '</span>'
      ].join('');
    }).join(',');
  }

  function generateEntityMessages(entity, index) {
    let html = '';
    entity.methods.forEach(function (method) {
      html += [
        '<li id="', messageID(entity.name, method.name, index), '" class="mu-classes-entity-message">',
        '  <span class="mu-classes-entity-message-name">',
        '    <span class="mu-classes-return">', method.return, '</span>',
        '    <span>',
               method.name, '(', generateParams(entity, method, index), ')',
        '    </span>',
        '  </span>',
        '</li>'
      ].join('');
    });
    return html;
  }

  function appendEntities($diagram, entities, index) {
    entities.forEach(function (entity) {
      const $entity = $([
        '<div id="', entityID(entity.name, index), '" class="mu-classes-entity">',
        '  <div class="mu-classes-entity-name">',
        '  <span class="mu-classes-kind ', entity.type, '">', entity.type[0].toUpperCase(), '</span>',
        '  ', entity.name,
        '  </div>',
        entity.variables.length? '  <ul class="mu-classes-entity-attributes">' : '',
        entity.variables.length?      generateEntityAttributes(entity, index) : '',
        entity.variables.length? '  </ul>' : '',
        entity.methods.length?   '  <ul class="mu-classes-entity-messages">' : '',
        entity.methods.length?        generateEntityMessages(entity, index) : '',
        entity.methods.length?   '  </ul>' : '',
        '</div>',
      ].join(''));
      $diagram.append($entity);
    });
  }

  $.fn.renderClasses = function () {
    const self = this;
    self.empty();
    self.each(function (i) {
      //Don't draw if hidden
      if ((self[i].offsetParent === null)) return;

      const $diagram = $(self[i]);

      const entities = mapEntities($diagram.data('code'));

      appendEntities($diagram, entities, i);
      // appendConnectors($diagram, entities, i);
    });
    return self;
  };

  mumuki.resize(function () {
    $('.mu-classes').renderClasses();
  });

});
