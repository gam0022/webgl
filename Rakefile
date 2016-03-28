task :preview do
  require 'webrick'
  include WEBrick

  module WEBrick::HTTPServlet
    FileHandler.add_handler('rb', CGIHandler)
  end

  s = HTTPServer.new(
    :Port => 3000,
    #:DocumentRoot => File.join(Dir.pwd, "/html")
    :DocumentRoot => File.join(Dir.pwd),
    :DirectoryIndex => ['index.rb', 'index.html']
  )
  trap("INT") { s.shutdown }
  s.start
end
