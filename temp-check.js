var fso = new ActiveXObject("Scripting.FileSystemObject");
var file = fso.OpenTextFile("temp-script.js", 1);
var content = file.ReadAll();
file.Close();
try {
  new Function(content);
  WScript.Echo('SYNTAX OK');
} catch(e) {
  WScript.Echo('SYNTAX ERROR: ' + e.message);
  WScript.Echo(e.line + ':' + e.column);
  WScript.Echo(e.stack);
  WScript.Quit(1);
}