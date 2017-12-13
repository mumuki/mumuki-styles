
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

})(window, document);

