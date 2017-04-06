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

## License

This project is available as open source under the terms of the [MIT License](http://opensource.org/licenses/MIT).
