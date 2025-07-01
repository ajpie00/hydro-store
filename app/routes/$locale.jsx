let Outlet;

try {
  Outlet = require('@remix-run/react').Outlet;
} catch (_err) {
  Outlet = ({children}) => children;
}

export default function LocaleLayout() {
  return <Outlet />;
}
