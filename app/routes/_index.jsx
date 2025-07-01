import {redirect} from '@shopify/remix-oxygen';

export async function loader() {
  return redirect('/en');
}

export default function Index() {
  return null;
}
