const { cookies } = require("next/headers");
const { verifyToken, COOKIE_NAME } = require("../lib/auth");
const NavBar = require("../components/NavBar").default;
require("./globals.css");

async function getSession() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

async function RootLayout({ children }) {
  const session = await getSession();
  return (
    <html lang="en">
      <body>
        <NavBar user={session} />
        {children}
      </body>
    </html>
  );
}

module.exports = RootLayout;
module.exports.default = RootLayout;
module.exports.metadata = {
  title: "Foundry Row — Where founders meet investors",
  description: "Post startup pitches. Browse deal flow. Express interest.",
};
