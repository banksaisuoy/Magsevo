module.exports = [
  {
    ignores: ["node_modules/**", "public/js/lib/**", "tests/**", "test_setup.js"]
  },
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        document: "readonly",
        window: "readonly",
        console: "readonly",
        process: "readonly",
        __dirname: "readonly",
        module: "readonly",
        require: "readonly",
        App: "readonly",
        AdminModules: "readonly",
        fetch: "readonly",
        localStorage: "readonly",
        setTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        URL: "readonly",
        FormData: "readonly",
        Blob: "readonly",
        UserManagement: "readonly",
        VideoManagement: "readonly",
        CategoryManagement: "readonly",
        ReportLogManagement: "readonly",
        SiteSettings: "readonly",
        GroupsManagement: "readonly",
        PermissionsManagement: "readonly",
        PasswordPolicyManagement: "readonly",
        ReportReasonsManagement: "readonly",
        AIFeaturesManagement: "readonly",
        AISettingsManagement: "readonly",
        VideoCompressionManagement: "readonly",
        SystemHealthManagement: "readonly",
        BackupSystemManagement: "readonly"
      }
    }
  }
];
