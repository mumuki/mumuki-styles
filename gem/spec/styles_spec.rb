require "spec_helper"

describe Mumuki::Styles do
  it { expect(File.exist? Mumuki::Styles.assets_path_for('javascripts/mumuki-styles.js')).to be true }
  it { expect(File.exist? Mumuki::Styles.assets_path_for('fonts/dev-awesome.svg')).to be true }
  it { expect(File.exist? Mumuki::Styles.assets_path_for('stylesheets/css/mumuki-styles.css')).to be true }
  it { expect(File.exist? Mumuki::Styles.assets_path_for('stylesheets/scss/mumuki-styles.scss')).to be true }
end
