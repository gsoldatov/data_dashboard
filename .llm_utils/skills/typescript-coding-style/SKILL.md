---
name: typescript-coding-style
description: Provides general instructions on how to write TypeScript code. Use when writing or modifying TypeScript code.
---

The rules from the following list should apply to any TypeScript code written, unless user instructs to do otherwise:
- write code for "strict" mode checks;
- use 4 space chars for indentation;
- use 2 empty lines for separation on the top-level scope (similar items, like global variables and one-line functions, do not need separations);
- add docstrings for functions, classes, methods and top-level variables:
    - for trivial cases, parameter and return variables, or the docstring itself may be skipped:
        - trivial cases include:
            - variables, short functions and simple classes, which are not used outside of the module they are defined in;
            - short private methods;
            - short functions and variables, the meaning of which is fully explained by their names;
    - try to keep docstrings short;
- do not update or remove existing comments, unless the related to the comment code is changed;
- use `const` or `let` for variable & function definitions;
- use named module exports;
