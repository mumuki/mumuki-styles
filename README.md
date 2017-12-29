# mumuki-styles

### How to use it in with rails-assets?

1. Add the following code into `Gemfile`

 ```ruby
 source 'https://rails-assets.org' do
   gem 'rails-assets-mumuki-styles'
 end
 ```

  or use a specific version

  ```ruby
  source 'https://rails-assets.org' do
    gem 'rails-assets-mumuki-styles', '1.3.0'
  end
  ```

1. Install it running

  ```bash
  bundle install
  ```

1. Add the following code into `app/assets/javascripts/application.js`

  ```js
  //= require mumuki-styles
  //= require bootstrap-sass
  ```

1. Add the following code into `app/assets/stylesheets/application.scss`

  ```scss
  @import "mumuki-styles";
  ```
  **Note**: If you do not use SCSS, add `*= require mumuki-styles` to `app/assets/stylesheets/application.css` file


### How to use it with bower?

1. Run `bower install --save mumuki-styles`
1. Add the css and js files to `index.html`

  ```html
  <link rel="stylesheet" href="bower_compoments/mumuki-styles/dist/css/mumuki-styles.css">
  <script src="bower_compoments/mumuki-styles/dist/javascript/mumuki-styles.js"></script>
  ```
1. if you are using SCSS, simply import the scss file

  ```scss
  @import "bower_compoments/mumuki-styles/dist/scss/mumuki-styles.scss"
  ```

### Using mu-file-browser

```html
  <div
    class="mu-file-browser"
    data-can-browse="true"
    data-on-file-open="console.log"
    data-file='{
      "foo": {
        "saraza": {
          "sultano.rb": "sultano"
        },
        "sultano.rb": "sultano",
        "mengano.js": "mengano"
      },
      "bar": {
        "archivo con un nombre largo.doc": "un doc"
      },
      "baz": {
        "mengano.js": "mengano"
      },
      "saraza.txt": "saraza",
      "sultano.rb": "sultano",
      "mengano.js": "mengano",
      "archivo con un nombre largo.doc": "un doc"
    }'>
  </div>
```

#### mu-file-browser attributes

* `data-can-browse`: (Boolean) user can enter into a folder (default `false`).
* `data-on-file-open`: (Function) receives 2 params, file name and file content. If no function given user can't open files.
* `data-file`: (Hash) hash `keys` are the names of the resources and hash `values` are theirs contents (sub-hash for a folder and a string for a file).

With jQuery you can use function `$('.mu-file-browser').renderFileBrowser()`;

```html
<div
  class='mu-erd'
  data-entities='{
    "Entity_1": {
      "ent1_id": {
        "type": "Integer",
        "pk": true
      },
      "ent2_id": {
        "type": "Integer",
        "pk": true,
        "fk": {
          "to": { "entity": "Entity_2", "column": "ent2_id" },
          "type": "one_to_one"
        }
      },
      "ent1_description": {
        "type": "Varchar"
      }
    },
    "Entity_2": {
      "ent2_id": {
        "type": "Integer",
        "pk": true
      }
    },
    "Entity_3": {
      "ent3_id": {
        "type": "Integer",
        "pk": true
      },
      "ent2_id": {
        "type": "Integer",
        "pk": true,
        "fk": {
          "to": { "entity": "Entity_2", "column": "ent2_id" },
          "type": "many_to_one"
        }
      },
      "ent1_description": {
        "type": "Varchar"
      }
    }
  }'>
</div>
```

#### mu-erd attributes

* `data-entities`: (`Hash<EntityName, EntityColumns>`)
  * `EntityName`: (`String`).
  * `EntityColumns`: (`Hash<ColumnName, ColumnMetadata>`)
    * `ColumnName`: (`String`)
    * `ColumnMetadata`: (`Hash`)
      * `type`: (`String`) Column type (Char, Number, Integer, Varchar, etc),
      * `pk`: (`Boolean` - Optional) True if column es PK or part of one,
      * `fk`: (`Hash` - Optional) with properties:
        * `to`: (`Object`) { entity: (Foreign entity), column: (Foreign column name) }
        * `type`: (`String`) one\_to\_one | one\_to\_many | many\_to\_one | many\_to\_many

With jQuery you can use function `$('.mu-erd').renderERD()`;


```html
  <div
    class='mu-browser'
    data-url='https://mi-sitio.mumuki.io'
    data-title='Mumuki - Aprender a programar'
    data-favicon='https://mumuki.io/logo-alt.png'
    data-srcdoc='<p>Hello Mumuki Browser</p>'>
  </div>
```

#### mu-browser attributes

* `data-srcdoc`: HTML of the page to show
* `data-url`: (Optional) URL of the page (default: `https://mumuki.io`)
* `data-title`: (Optional) Title of the browser's tab (default: `Mumuki`)
* `data-favicon`: (Optional) Favicon of the brower's tab (default: `https://mumuki.io/logo-alt.png`)

With jQuery you can use function `$('.mu-erd').renderWebBrowser()`;


## Installing

You usually add `mumuki-styles` to an empty project. First you need to add it to your Gemfile:

```ruby
gem 'mumuki-styles'
```

or, if you want latest version:

```ruby
gem 'mumuki-styles', github: 'mumuki/mumuki-styles', branch: 'master'
```

And then bundle install

## Ruby Version

`mumuki-styles` works with Ruby 2.3.1


## License

This project is available as open source under the terms of the [MIT License](http://opensource.org/licenses/MIT).
