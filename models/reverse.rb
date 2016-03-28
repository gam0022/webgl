while line = gets
  a = line.chomp.split(' ')
  puts [ a[0], a[1], a[3], a[2] ].join(' ')
end
