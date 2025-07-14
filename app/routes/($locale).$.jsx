/**
 * @param {LoaderFunctionArgs}
 */
export async function loader({request}) {
  throw new Response(`${new URL(request.url).pathname} not found`, {
    status: 404,
  });
}

export default function CatchAllPage() {
  return (
    <div style={{padding: '2rem'}}>
      <h1>404 – Sayfa Bulunamadı</h1>
      <p>Aradığınız sayfa mevcut değil veya kaldırılmış olabilir.</p>
    </div>
  );
}

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
