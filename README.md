# mumuki-styles

[![Build Status](https://travis-ci.org/mumuki/mumuki-styles.svg?branch=master)](https://travis-ci.org/mumuki/mumuki-styles)

## Components

### mu-file-browser

![image](https://user-images.githubusercontent.com/1039278/34626522-c15fc584-f23b-11e7-81a4-dd5403a2e6f0.png)

```html
  <div class="mu-file-browser"
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

With jQuery you can manually render this component using `$('.mu-file-browser').renderFileBrowser()`;


### mu-erd

![image](https://user-images.githubusercontent.com/1039278/34626539-df245f30-f23b-11e7-9b21-1456c63105c9.png)

```html
<div class='mu-erd'
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

With jQuery you can manually render this component using `$('.mu-erd').renderERD()`;

### mu-browser

![image](https://user-images.githubusercontent.com/1039278/34626588-1829fbb4-f23c-11e7-89ec-540a23a41240.png)

```html
  <div class='mu-browser'
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

With jQuery you can manually render this component using `$('.mu-browser').renderWebBrowser()`;


### mu-sql-table

![image](https://user-images.githubusercontent.com/1039278/34626563-f531ec3e-f23b-11e7-8534-fd6855fea0b1.png)

```html
  <div class='mu-sql-table'
    data-name='Personas'
    data-columns='[{"name": "id_persona", "pk": true}, "Nombre", "Apellido", {"name": "Pareja", "fk": true}]'
    data-rows='[
      [1, "Homero", "Simpson", 2],
      [2, "Marge", "Bouvier", 1],
      [3, "Moe", "Szyslak", null]
    ]'>
  </div>
```

#### mu-sql-table attributes

* `data-name`: (String) Entity name
* `data-columns`: (String|Hash):
  * if `String`: Column name
  * if `Hash`: you need the next keys
    * `name`: (String) Column name
    * `pk`: (Bool) if column is PK or part of one
    * `fk`: (Bool) if column is FK or part of one
* `data-rows`: (Array<Array<Value>>)

With jQuery you can manually render this component using `$('.mu-sql-table').renderSqlTable()`;

### mu-sql-table-rendered

![image](https://user-images.githubusercontent.com/1039278/34626563-f531ec3e-f23b-11e7-8534-fd6855fea0b1.png)

```html
  <div class="mu-sql-table-rendered">
    <header>Personas</header>
    <table>
      <thead>
        <tr>
          <th class="mu-sql-table-pk">id_persona</th>
          <th>Nombre</th>
          <th>Apellido</th>
          <th class="mu-sql-table-fk">Pareja</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>Homero</td>
          <td>Simpson</td>
          <td>2</td>
        </tr>
        <tr>
          <td>2</td>
          <td>Marge</td>
          <td>Bouvier</td>
          <td>1</td>
        </tr>
        <tr>
          <td>3</td>
          <td>Moe</td>
          <td>Szyslak</td>
          <td>NULL</td>
        </tr>
      </tbody>
    </table>
  </div>
```

#### mu-sql-table-rendered attributes

You don't need any data attribute - just follow this convention:

* `div` (with `mu-sql-table-rendered` class)
  * `div > header`
  * `div > table`
    * `div > table > thead`
      * `div > table > thead > tr > th` (th tag can have `mu-sql-table-pk` and/or `mu-sql-table-fk`)
    * `div > table > tbody`
      * `div > table > tbody > tr > td`

With jQuery you can manually render this component using `$('.mu-sql-table-rendered').renderPrerenderedSqlTable()`;


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

### How to use it in with rails-assets?

1. Add the following code into `Gemfile`

  ```ruby
  gem 'mumuki-styles'
  ```

1. Install it running

  ```bash
  bundle install
  ```

1. Add the following code into `app/assets/javascripts/application.js`

  ```js
  //= require mumuki-styles
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


### Installing

 **Note:** Building `mumuki-styles` requires your `node` installation version to be 8 or greater and `yarn` to be 1 or greater.

```bash
yarn
yarn build
```


### Gem wrapper

This module can also be deployed a a ruby gem. `mumuki-styles` works with Ruby 2.3.1

```bash
cd gem
rake wrapper:wrap
bundle install
bundle exec rspec
```

### Tagging and releasing

```bash
./tag.sh
```

## License

This project is available as open source under the terms of the [MIT License](http://opensource.org/licenses/MIT).
