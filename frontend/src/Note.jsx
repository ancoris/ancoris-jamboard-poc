import React from 'react';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';

const Note = ({ id, content, imageUrl, x, y, width, height, backgroundColor, onDelete, onMove, onResizeStop, onColorChange }) => {

  const handleDrag = (e, data) => {
    onMove(id, data.x, data.y);
  };

  const handleResizeStop = (e, data) => {
    onResizeStop(id, data.size.width, data.size.height);
  };

  const handleColorChange = (e) => {
    onColorChange(id, e.target.value);
  };

  return (
    <Draggable position={{ x, y }} onDrag={handleDrag}>
      <ResizableBox width={width} height={height} minConstraints={[100, 100]} onResizeStop={handleResizeStop} className="note" style={{ backgroundColor }}>
        <div id={`note-${id}`}>
          {imageUrl && <img src={imageUrl} alt="Note" className="note-image" />}
          <div className="note-content">
            {content}
          </div>
          <button className="delete-button" onClick={() => onDelete(id)}>
            X
          </button>
          <input type="color" value={backgroundColor} onChange={handleColorChange} className="color-picker" />
        </div>
      </ResizableBox>
    </Draggable>
  );
};

export default Note;
