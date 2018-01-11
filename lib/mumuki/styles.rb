require "mumuki/styles/version"

module Mumuki
  module Styles
    class Engine < ::Rails::Engine
    end if defined? ::Rails::Engine
  end
end
