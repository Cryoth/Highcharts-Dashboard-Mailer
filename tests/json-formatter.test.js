const FormatJson = require('../lib/json-formatter.js');

test("Format JSON - Test sur création d'un objet Format JSON", () => {
	var json = new FormatJson();
	expect(typeof json).toBe('object');
	expect(json.title).toBe('');
	expect(json.subtitle).toBe('');
});

test("Format JSON - Test sur ajout de titre", () => {
	var json = new FormatJson();
	json.title = "Test";
	expect(json.title).toBe('Test');
});

test("Format JSON - Test sur ajout de sous-titre", () => {
	var json = new FormatJson();
	json.subtitle = "Test subtitle";
	expect(json.subtitle).toBe('Test subtitle');
});