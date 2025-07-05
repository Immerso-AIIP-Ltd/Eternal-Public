module.exports = {
    extends: [
      "react-app",
      "react-app/jest"
    ],
    rules: {
      // Disable specific unused variable warnings
      "no-unused-vars": [
        "warn", 
        { 
          vars: "all", 
          args: "after-used", 
          ignoreRestSiblings: false,
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_"
        }
      ],
      // Remove unnecessary escape character warnings
      "no-useless-escape": "off",
      // Handle default export
      "import/no-anonymous-default-export": "off",
      // Additional relaxed rules
      "react-hooks/exhaustive-deps": "warn"
    }
  };