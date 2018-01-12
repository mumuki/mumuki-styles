
lib = File.expand_path("../lib", __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
require "mumuki/styles/version"

Gem::Specification.new do |gem|
  gem.authors       = ["Federico Scarpa"]
  gem.email         = ["fedescarpa@gmail.com"]

  gem.summary       = "Mumuki Styles"
  gem.homepage      = "https://github.com/mumuki/mumuki-styles"
  gem.license       = "MIT"

  gem.files         = Dir["lib/**/*"] + Dir["app/**/*"] + ["Rakefile", "README.md"]
  gem.test_files    = `git ls-files -- {test,spec}/*`.split("\n")

  gem.name          = "mumuki-styles"
  gem.require_paths = ["lib"]
  gem.version       = Mumuki::Styles::VERSION

  gem.add_development_dependency "bundler", "~> 1.16.a"
  gem.add_development_dependency "rake", "~> 10.0"

  gem.required_ruby_version = '~> 2.3'
end
