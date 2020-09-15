interface IFuseOptions {
    /**
     * The name of the identifier property. If specified,
     * the returned result will be a list of the items' identifiers, otherwise it will be a list of the items
     */
    id?: string,
    /**
     * Indicates whether comparisons should be case sensitive.
     */
    caseSensitive?: boolean,
    /**
     * Whether to sort the result list, by score.
     */
    shouldSort?: boolean,
    /**
     * When true, the algorithm will search individual words and the full string,
     * computing the final score as a function of both. In this case, the threshold,
     * distance, and location are inconsequential for individual tokens, and are thus ignored
     */
    tokenize?: boolean,
    /**
     * When true, the result set will only include records that match all tokens. Will only work if tokenize is also true.
     */
    matchAllTokens?: boolean,
    /**
     * When true, the matching function will continue to the end of a search pattern even if a perfect match has already been located in the string
     */
    findAllMatches?: boolean,
    /**
     * Whether the score should be included in the result set.
     * A score of 0 indicates a perfect match, while a score of 1 indicates a complete mismatch
     */
    includeScore?: boolean,
    /**
     * Whether the matches should be included in the result set.
     * When true, each record in the result set will include the indices of the matched characters: indices: [start, end].
     * These can consequently be used for highlighting purposes
     */
    includeMatches?: boolean,
    /**
     * At what point does the match algorithm give up. A threshold of 0.0 requires a perfect match (of both letters and location),
     * a threshold of 1.0 would match anything.
     */
    threshold: number,
    /**
     * Determines approximately where in the text is the pattern expected to be found.
     */
    location: number,
    /**
     * Determines how close the match must be to the fuzzy location (specified by location).
     * An exact letter match which is distance characters away from the fuzzy location would score as a complete mismatch.
     * A distance of 0 requires the match be at the exact location specified, a distance of 1000 would require a perfect
     * match to be within 800 characters of the location to be found using a threshold of 0.8.
     */
    distance: number,
    /**
     * He maximum length of the pattern. The longer the pattern (i.e. the search query),
     * the more intensive the search operation will be.
     * Whenever the pattern exceeds the maxPatternLength, an error will be thrown
     * */
    maxPatternLength: number,
    /**
     * When set to include matches, only the matches whose length exceeds this value will be returned.
     * (For instance, if you want to ignore single character index returns, set to 2)
     */
    minMatchCharLength?: number,
    /**
     * List of properties that will be searched.
     * This supports nested properties, weighted search, searching in arrays of strings and objects
     */
    keys: Array<string | { name: string, weight: number }>
}

interface IFuseResult<T> {
    item: T;
    refIndex: number;
}

declare class Fuse<T> {
    constructor(data: T[], opts: IFuseOptions);
    public search(key: string): Array<IFuseResult<T>>;
}
