import * as React from 'react';
import { observer } from 'mobx-react';

interface Props {
  position: { left: number; top: number };
  size: { width: number; height: number };
  children: JSX.Element;
}

export default observer(Panel);
function Panel({ position, size, children }: Props) {
  const [isSizeChanging, setIsSizeChanging] = React.useState(false);
  const [siz, setSize] = React.useState(size);
  const [pos, setPos] = React.useState(position);
  const dragStart = React.useRef<{ x: number; y: number } | null>(null);
  const domPos = React.useRef<{ x: number; y: number }>({ x: pos.left, y: pos.top });
  const dom = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const mousemove = (e: MouseEvent) => {
      if (!dragStart.current) return;
      if (!domPos.current) return;
      if (isSizeChanging) {
        const width = e.pageX - domPos.current.x;
        const height = e.pageY - domPos.current.y;
        setSize({ width, height });
        if (dom.current) {
          const child = dom.current.children[0].children[0] as HTMLDivElement;

          const overSizeY = child.clientHeight > dom.current.clientHeight;
          const overSizeX = child.clientWidth > dom.current.clientWidth;

          child.style.marginTop = overSizeY ? '0' : '';
          child.style.marginLeft = overSizeX ? '0' : '';
        }
      } else {
        const movementX = e.pageX - dragStart.current.x;
        const movementY = e.pageY - dragStart.current.y;
        const left = domPos.current.x + movementX;
        const top = domPos.current.y + movementY;
        setPos({ left, top });
      }
    };
    document.addEventListener('mousemove', mousemove);
    return () => document.removeEventListener('mousemove', mousemove);
  }, [isSizeChanging]);
  React.useEffect(() => {
    const mouseup = () => {
      if (!dragStart.current) return;
      dragStart.current = null;
      domPos.current = { x: pos.left, y: pos.top };
      setIsSizeChanging(false);
    };
    document.addEventListener('mouseup', mouseup);
    return () => document.removeEventListener('mouseup', mouseup);
  }, [pos]);

  return (
    <div
      className="panel"
      onMouseDownCapture={e => (dragStart.current = { x: e.pageX, y: e.pageY })}
      style={{ ...siz, ...pos }}
      ref={dom}
    >
      <div>{children}</div>
      <div onMouseDownCapture={e => setIsSizeChanging(true)} />
    </div>
  );
}
