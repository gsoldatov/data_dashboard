---
name: typescript-coding-style
description: Provides general instructions on how to write TypeScript code. Use when writing or modifying TypeScript code or config files in a Typescript project.
---

# General
The following rules should apply to any TypeScript code (or config files in a Typescript project) written, unless user instructs to do otherwise:

# Style and Formatting
- use 4 space chars for indentation;
- use 2 empty lines for separation in the modules scope (similar items, like global variables and one-line functions, do not need separation);

# Naming
- file & directory names must consist of lowercase letters, digits and hyphens, which separate words;
- file & directory names should either have the name of the main artifact inside them or reflect the meaning of contents inside them;

# Comments
- add docstrings for functions, classes, methods and top-level variables:
    - for trivial cases, parameter and return variables, or the docstring itself may be skipped:
        - trivial cases include:
            - variables, short functions and simple classes, which are not used outside of the module they are defined in;
            - short private methods;
            - short functions and variables, the meaning of which is fully explained by their names;
    - try to keep docstrings short;
- do not update or remove existing comments, unless the related to the comment code is changed;

# Code Writing Guidelines
- write code for "strict" mode checks;
- use `const` or `let` for variable & function definitions;
- use named module exports;
- do not add default values for function arguments, unless it's explicitly required by task (or makes a strong sense) to do otherwise;
