
(function (window, document) {
  'use strict';

  window.mumuki = {};

  var hasTurbolinksGreaterOrEqualThanVersion5 = function () {
    return window.Turbolinks && !window.Turbolinks.EVENTS;
  }

  var hasTurbolinksLowerThanVersion5 = function () {
    return window.Turbolinks && window.Turbolinks.EVENTS && window.Turbolinks.EVENTS.LOAD;
  }

  mumuki.load = function (callback) {
    if (hasTurbolinksLowerThanVersion5()) {
      $(document).on('page:load', callback);
      $(document).ready(callback);
    } else if (hasTurbolinksGreaterOrEqualThanVersion5()) {
      $(document).on('turbolinks:load', callback);
    } else {
      $(document).ready(callback);
    }
  }

  mumuki.load(function () {

    var descriptorType = {
      file: {
        open: function (state, filename) {
          if (state.onFileOpen) {
            var onFileOpen = eval(state.onFileOpen);
            if (typeof onFileOpen === 'function') {
              onFileOpen(filename, lastFolder(state)[filename]);
            } else {
              throw new Error('"data-on-file-open" should be a function');
            }
          }
        }
      },
      folder: {
        open: function (state, foldername) {
          if (state.canBrowse) {
            var folder = lastFolder(state)[foldername];
            state.breadcrumb.push({name: foldername, files: folder});
            createExplorerFrom(state, folder);
          }
        }
      }
    }

    function back(state) {
      if (state.breadcrumb.length > 1) {
        state.breadcrumb.pop();
        createExplorerFrom(state, lastFolder(state));
      }
    }

    function getPath(state) {
      return state.breadcrumb
        .map(function (it) {
          return it.name;
        })
        .join('/') || '/';
    }

    function lastFolder(state) {
      return state.breadcrumb[state.breadcrumb.length - 1].files;
    }

    function sortByTypeAndName(obj, key1, key2) {
      if (typeof obj[key1] === typeof obj[key2]) {
        return key1.localeCompare(key2);
      } else if (obj[key1] instanceof Object && obj[key2] instanceof String) {
        return 1;
      } else {
        return -1;
      }
    }

    function sortedFilesKeys(files) {
      return Object.keys(files || {}).sort(function (a, b) {
        return sortByTypeAndName(files, a, b);
      });
    }

    function getListItem(files, key, state) {
      return $([
        '<li>',
        '  <i class="' + fileBrowserClassType(files[key]) + '"></i>',
        '  <span>' + key + '</span>',
        '</li>'].join(''))
      .click(function () {
        descriptorType[fileBrowserClassType(files[key])].open(state, key);
      });
    }

    function fileBrowserClassType(file) {
      return file instanceof Object ? 'folder' : 'file';
    }

    function appendFiles($ul, files, state) {
      sortedFilesKeys(files).forEach(function (key) {
        $ul.append(getListItem(files, key, state));
      });
    }

    function createExplorerFrom(state, files) {
      state.container.empty();
      var $ul = $('<ul></ul>');
      appendFiles($ul, files, state);
      state.container.append($ul);
      state.header.find('.mu-file-browser-path').val(getPath(state));
    }

    function getExplorerHeader(canBrowse) {
      return $([
        '<header>',
           canBrowse ? '<i class="fa fa-fw fa-arrow-left"></i>' : '',
        '  <input class="mu-file-browser-path" type="text" readonly>',
        '</header>'
      ].join(''))
    }

    $.fn.renderFileBrowser = function () {
      var self = this;
      self.empty();
      self.each(function (i) {
        var $explorer = $(self[i]);
        var files = $explorer.data('file');
        var canBrowse = $explorer.data('can-browse');
        var onFileOpen = $explorer.data('on-file-open');

        var $header = getExplorerHeader(canBrowse);
        var $main = $('<main></main>');

        var ROOT_FOLDER_NAME = '/home/mumuki';


        if (files instanceof Object) {
          var state = {
            container: $main,
            header: $header,
            canBrowse: !!canBrowse,
            onFileOpen: onFileOpen,
            breadcrumb: [{name: ROOT_FOLDER_NAME, files: files}]
          };

          $explorer.append($header);
          $explorer.append($main);

          $header.find('i').click(function () {
            back(state)
          });

          createExplorerFrom(state, files);

        }
      });
      return self;
    }

    $('.mu-file-browser').renderFileBrowser();

  });


  mumuki.load(function () {

    function entityID(entity) {
      return 'mu-erd-' + entity.toLowerCase().replace(/[_]/g, '-');
    }

    function columnID(entity, column) {
      return entityID(entity) + '-' + column.toLowerCase().replace(/[_]/g, '-');
    }

    function keyIconFor(column, field) {
      var bool = (column[field] instanceof Array && column[field].length > 0) || (!!column[field]);
      return bool ? '<i class="fa fa-fw fa-key mu-erd-' + field + '"></i>' : '';
    }

    function generateEntityColumns(entity) {
      var columns = entity.columns || [];
      var html = '';
      columns.forEach(function (column) {
        html += [
          '<li id="', columnID(entity.name, column.name), '" class="mu-erd-entity-column">',
          '  <span class="mu-erd-entity-column-name">',
               keyIconFor(column, 'pk'),
               keyIconFor(column, 'fks'),
               '<span>', column.name, '</span>',
          '  </span>',
          '  <span class="mu-erd-entity-column-type">', column.type, '</span>',
          '</li>'
        ].join('');
      })
      return html;
    }

    function appendEntities($diagram, entities) {
      entities.forEach(function (entity) {
        var $entity = $([
          '<div id="', entityID(entity.name), '" class="mu-erd-entity">',
          '  <div class="mu-erd-entity-name">',
               entity.name,
          '  </div>',
          '  <ul class="mu-erd-entity-columns">',
               generateEntityColumns(entity),
          '  </ul>',
          '</div>',
        ].join(''));
        $diagram.append($entity);
      });
    }

    function drawConnectorLines(entity) {
      var columns = entity.columns || [];
      return columns.map(function (column) {
        var fks = column.fks || [];
        return fks.map(function (fk) {
          return connectors[fk.type](entity, column, fk);
        }).join('');
      }).join('');
    }

    function getSVGFor(entity) {
      return ['<svg id="', entityID(entity.name), '-svg">', drawConnectorLines(entity), '</svg>'].join('');
    }

    function appendConnectors($diagram, entities) {
      entities.forEach(function (entity) {
        var $svg = $(getSVGFor(entity));
        $diagram.append($svg);
      });
    }

    $.fn.renderERD = function () {
      var self = this;
      self.each(function (i) {
        var $diagram = $(self[i]);
        var entities = $diagram.data('entities');
        appendEntities($diagram, entities);
        appendConnectors($diagram, entities);
      });
      return self;
    }

    var connectors = {
      one_to_one: function(entity, column, fk) {
        var $entityFrom = $('#' + entityID(entity.name));
        var $columnFrom = $('#' + columnID(entity.name, column.name));
        var $entityTo = $('#' + entityID(fk.to.entity));
        var $columnTo = $('#' + columnID(fk.to.entity, fk.to.column));

        var fromX = $entityFrom.position().left + $entityFrom.width() + ($entityFrom.css('border-width')[0] * 2);
        var fromY = $columnFrom.position().top + $columnFrom.height() / 2;
        var toX = $entityTo.position().left;
        var toY = $columnTo.position().top + $columnTo.height() / 2;

        var middle = (fromX + toX) / 2;

        return [
          '<line x1="', fromX, '" x2="', middle, '" y1="', fromY, '" y2="', fromY, '" stroke="black" stroke-width="1"/>',
          '<line x1="', middle, '" x2="', middle, '" y1="', fromY, '" y2="', toY, '" stroke="black" stroke-width="1"/>',
          '<line x1="', middle, '" x2="', toX, '" y1="', toY, '" y2="', toY, '" stroke="black" stroke-width="1"/>',

          '<line x1="', fromX + 10, '" x2="', fromX + 10, '" y1="', fromY - 10, '" y2="', fromY + 10, '" stroke="black" stroke-width="1"/>',

          '<line x1="', toX - 10, '" x2="', toX - 10, '" y1="', toY - 10, '" y2="', toY + 10, '" stroke="black" stroke-width="1"/>',

        ].join('')
      },
      many_to_one: function(entity, column, fk) {
        var $entityFrom = $('#' + entityID(entity.name));
        var $columnFrom = $('#' + columnID(entity.name, column.name));
        var $entityTo = $('#' + entityID(fk.to.entity));
        var $columnTo = $('#' + columnID(fk.to.entity, fk.to.column));

        var fromX = $entityFrom.position().left + $entityFrom.width() + ($entityFrom.css('border-width')[0] * 2);
        var fromY = $columnFrom.position().top + $columnFrom.height() / 2;
        var toX = $entityTo.position().left;
        var toY = $columnTo.position().top + $columnTo.height() / 2;

        var middle = (fromX + toX) / 2;

        return [
          '<line x1="', fromX, '" x2="', middle, '" y1="', fromY, '" y2="', fromY, '" stroke="black" stroke-width="1"/>',
          '<line x1="', middle, '" x2="', middle, '" y1="', fromY, '" y2="', toY, '" stroke="black" stroke-width="1"/>',
          '<line x1="', middle, '" x2="', toX, '" y1="', toY, '" y2="', toY, '" stroke="black" stroke-width="1"/>',

          '<line x1="', fromX, '" x2="', fromX + 10, '" y1="', fromY - 10, '" y2="', fromY, '" stroke="black" stroke-width="1"/>',
          '<line x1="', fromX, '" x2="', fromX + 10, '" y1="', fromY + 10, '" y2="', fromY, '" stroke="black" stroke-width="1"/>',

          '<line x1="', toX - 10, '" x2="', toX - 10, '" y1="', toY - 10, '" y2="', toY + 10, '" stroke="black" stroke-width="1"/>',
          '<line x1="', toX - 10, '" x2="', toX - 10, '" y1="', toY - 10, '" y2="', toY + 10, '" stroke="black" stroke-width="1"/>',

        ].join('')
      },
      one_to_many: function(entity, column, fk) {
        var $entityFrom = $('#' + entityID(entity.name));
        var $columnFrom = $('#' + columnID(entity.name, column.name));
        var $entityTo = $('#' + entityID(fk.to.entity));
        var $columnTo = $('#' + columnID(fk.to.entity, fk.to.column));

        var fromX = $entityFrom.position().left + $entityFrom.width() +  + ($entityFrom.css('border-width')[0] * 2);
        var fromY = $columnFrom.position().top + $columnFrom.height() / 2;
        var toX = $entityTo.position().left;
        var toY = $columnTo.position().top + $columnTo.height() / 2;

        var middle = (fromX + toX) / 2;

        return [
          '<line x1="', fromX, '" x2="', middle, '" y1="', fromY, '" y2="', fromY, '" stroke="black" stroke-width="1"/>',
          '<line x1="', middle, '" x2="', middle, '" y1="', fromY, '" y2="', toY, '" stroke="black" stroke-width="1"/>',
          '<line x1="', middle, '" x2="', toX, '" y1="', toY, '" y2="', toY, '" stroke="black" stroke-width="1"/>',

          '<line x1="', fromX + 10, '" x2="', fromX + 10, '" y1="', fromY - 10, '" y2="', fromY + 10, '" stroke="black" stroke-width="1"/>',
          '<line x1="', fromX + 10, '" x2="', fromX + 10, '" y1="', fromY - 10, '" y2="', fromY + 10, '" stroke="black" stroke-width="1"/>',

          '<line x1="', toX, '" x2="', toX - 10, '" y1="', toY - 10, '" y2="', toY, '" stroke="black" stroke-width="1"/>',
          '<line x1="', toX, '" x2="', toX - 10, '" y1="', toY + 10, '" y2="', toY, '" stroke="black" stroke-width="1"/>',

        ].join('')
      },
      many_to_many: function(entity, column, fk) {
        var $entityFrom = $('#' + entityID(entity.name));
        var $columnFrom = $('#' + columnID(entity.name, column.name));
        var $entityTo = $('#' + entityID(fk.to.entity));
        var $columnTo = $('#' + columnID(fk.to.entity, fk.to.column));

        var fromX = $entityFrom.position().left + $entityFrom.width() + ($entityFrom.css('border-width')[0] * 2);
        var fromY = $columnFrom.position().top + $columnFrom.height() / 2;
        var toX = $entityTo.position().left;
        var toY = $columnTo.position().top + $columnTo.height() / 2;

        var middle = (fromX + toX) / 2;

        return [
          '<line x1="', fromX, '" x2="', middle, '" y1="', fromY, '" y2="', fromY, '" stroke="black" stroke-width="1"/>',
          '<line x1="', middle, '" x2="', middle, '" y1="', fromY, '" y2="', toY, '" stroke="black" stroke-width="1"/>',
          '<line x1="', middle, '" x2="', toX, '" y1="', toY, '" y2="', toY, '" stroke="black" stroke-width="1"/>',

          '<line x1="', fromX, '" x2="', fromX + 10, '" y1="', fromY - 10, '" y2="', fromY, '" stroke="black" stroke-width="1"/>',
          '<line x1="', fromX, '" x2="', fromX + 10, '" y1="', fromY + 10, '" y2="', fromY, '" stroke="black" stroke-width="1"/>',

          '<line x1="', toX, '" x2="', toX - 10, '" y1="', toY - 10, '" y2="', toY, '" stroke="black" stroke-width="1"/>',
          '<line x1="', toX, '" x2="', toX - 10, '" y1="', toY + 10, '" y2="', toY, '" stroke="black" stroke-width="1"/>',

        ].join('')
      }
    }

    window.addEventListener('resize', function () {
      $('.mu-erd').empty().renderERD();
    });

    $('.mu-erd').renderERD();

  });


})(window, document);

