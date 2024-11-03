export interface YAMLData {
    context: {
      expressions: Record<string, string[]>;
      slots: Record<string, string[]>;
      macros: Record<string, string[]>;
    };
}