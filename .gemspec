# frozen_string_literal: true

Gem::Specification.new do |spec|
  spec.name          = 'client_side_validations'
  spec.version       = '1.0.0'
  spec.authors       = ['Ram']
  spec.email         = ['ram@thegenielab.com']

  spec.summary       = 'Client Side Validations for Rails'
  spec.description   = 'Adds client-side validations using ActiveModel validators'
  spec.homepage      = 'https://github.com/wntechs/client_side_validations'
  spec.license       = 'MIT'

  # Files
  spec.files         = Dir.glob('lib/**/*') + ['README.md', 'LICENSE', 'Rakefile']
  spec.require_paths = ['lib']

  # Dependencies
  spec.add_dependency 'js_regex'
  spec.add_dependency 'rails', '>= 6.0', '< 8.0'
end