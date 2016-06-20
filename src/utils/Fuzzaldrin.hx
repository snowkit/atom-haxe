package utils;

using StringTools;

typedef FuzzaldrinFilterOptions = {

        /** The property to use for scoring if the candidates are objects. */
    @:optional var key:String;

        /** The maximum numbers of results to return. */
    @:optional var max_results:Int;

} //FuzzaldrinFilterOptions

    /** Simplified haxe port of fuzzaldrin: https://github.com/atom/fuzzaldrin
        Used to filter/score strings */
class Fuzzaldrin {

    static var like_spaces = {'-': true, '_': true, ' ': true};

    static var path_separator = Sys.getCwd().indexOf('\\') == -1 ? '/' : '\\';

        /** Sort and filter the given candidates by
            matching them agains the given query */
    public static function filter<T>(candidates:Array<T>, query:String, ?options:FuzzaldrinFilterOptions):Array<T> {

        var key = options != null ? options.key : null;
        var max_results = options != null ? options.max_results : null;

        if (query != null) {

            var scored_candidates:Array<T> = [];

            query = query.trim();

            if (query.length > 0) {

                var scored_candidates:Array<{candidate:T,score:Float}> = [];
                var string:String;
                var score:Float;

                for (candidate in candidates) {

                    string = key != null && key.length > 0 ? Reflect.field(candidate, key) : cast candidate;

                    if (string != null && string.length > 0) {

                        score = compute_score(string, query);

                        if (score > 0) {
                            scored_candidates.push({
                                candidate: candidate,
                                score: score
                            });
                        }

                    }
                }

                    // Sort score in descending order
                scored_candidates.sort(untyped sort_by_score);

                candidates = scored_candidates.map(pluk_candidates);
            }
        }

        if (max_results != null) {
            var result = [];
            for (i in 0...max_results) {
                result.push(candidates[i]);
            }
        }

        return candidates;

    } //filter

/// Score

        /** Score the given string against the given query */
    public static function score(string:String, query:String):Float {

        if (string == null || string.length == 0) return 0.0;
        if (query == null || query.length == 0) return 0.0;

        query = query.trim();

        return compute_score(string, query);

    } //score

    static function compute_score(string:String, query:String):Float {

        if (string == query) return 1;

        var total_character_score:Float = 0;
        var query_length:Int = query.length;
        var string_length:Int = string.length;

        var index_in_query = 0;
        var index_in_string = 0;

        var character:String;
        var lowercase_index:Int;
        var uppercase_index:Int;
        var min_index:Int;
        var character_score:Float;

        while (index_in_query < query_length) {

            character = query.charAt(index_in_query++);
            lowercase_index = string.indexOf(character.toLowerCase());
            uppercase_index = string.indexOf(character.toUpperCase());
            min_index = cast Math.min(lowercase_index, uppercase_index);

            if (min_index == -1) {
                min_index = cast Math.max(lowercase_index, uppercase_index);
            }

            index_in_string = min_index;

            if (index_in_string == -1) return 0;

            character_score = 0.1;

                // Same case bonus.
            if (string.charAt(index_in_string) == character) {
                character_score += 0.1;
            }

            if (index_in_string == 0) {
                    // Start of string bonus
                character_score += 0.8;
            }
            else if (Reflect.field(like_spaces, string.charAt(index_in_string - 1)) != null) {
                    // Start of word bonus
                character_score += 0.7;
            }

                // Trim string to after current abbreviation match
            string = string.substring(index_in_string + 1, string_length);

            total_character_score += character_score;
        }

        var query_score = total_character_score / query_length;
        return ((query_score * (query_length / string_length)) + query_score) / 2;

    } //compute_score

    static function sort_by_score(a:Dynamic, b:Dynamic):Float {

        return b.score - a.score;

    } //sort_by_score

    static function pluk_candidates<T>(a:{candidate:T,score:Float}):T {

        return a.candidate;

    } //pluk_candidates

}
