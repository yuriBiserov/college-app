import React from "react";

// set the defaults
const SignedAsContext = React.createContext({
  signed: "Student",
  setSigned: () => {}
});

export default SignedAsContext;
