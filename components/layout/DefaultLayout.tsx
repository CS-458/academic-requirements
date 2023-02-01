export default function DefaultLayout(props: {
  children: JSX.Element | JSX.Element[];
}): JSX.Element {
  return <div>{props.children}</div>;
}
