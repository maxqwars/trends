import typescript from "@rollup/plugin-typescript";
import shebang from "rollup-plugin-preserve-shebang";
import multi from "rollup-plugin-multi-input";
import terser from "@rollup/plugin-terser";

const build = "build";
const sources = "src";

export default {
  input: [`${sources}/**/*.{ts,js}`],
  output: {
    format: "esm",
    dir: build
  },
  plugins: [
    terser(),
    multi.default(),
    typescript(),
    shebang({
      shebang: "#!/usr/bin/env node"
    })
  ]
};
