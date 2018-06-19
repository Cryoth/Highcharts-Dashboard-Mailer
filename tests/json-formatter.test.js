const FormatJson = require('../lib/json-formatter.js');

test("Format JSON - Test sur création d'un objet Format JSON", () => {
	var json = new FormatJson();
	expect(typeof json).toBe('object');
	expect(json.Type).toBe('column');
	expect(json.Title).toBe('');
	expect(json.Subtitle).toBe('');
});

test("Format JSON - Test sur ajout de titre", () => {
	var json = new FormatJson();
	json.Title = "Test"
	expect(json.Title).toBe('Test');
});

test("Format JSON - Test sur ajout de sous-titre", () => {
	var json = new FormatJson();
	json.Subtitle = "Test subtitle"
	expect(json.Subtitle).toBe('Test subtitle');
});