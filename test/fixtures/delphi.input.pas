program Mine(output);

var
  s: string;

begin
  (*<jdists encoding="regex" pattern="/[^]*/" replacement="'$&\n$&'">*)
  s := 'hello world!';
  (*</jdists>*)
  Write(s);

end.