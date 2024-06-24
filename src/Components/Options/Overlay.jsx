import React, { useRef, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  // removeElements,
  // ControlsProvider,
} from "react-flow-renderer";

const initialElements = [
  {
    id: "1",
    type: "input",
    data: { label: "Image" },
    position: { x: 100, y: 100 },
  },
];

const Overlay = ({ src }) => {
  const [elements, setElements] = useState(initialElements);
  const reactFlowWrapper = useRef(null);

  const onResize = (event, node) => {
    // Handle resizing here
    // You can update the image size based on the node size
  };

  const onRotate = (event, node) => {
    // Handle rotation here
    // You can update the image rotation based on the node rotation
  };

  const onElementsRemove = (elementsToRemove) => {
    setElements((els) => removeElements(elementsToRemove, els));
  };

  const onConnect = (params) => {
    setElements((els) => addEdge(params, els));
  };

  return (
    <div style={{ height: "500px", border: "1px solid #ccc" }}>
      <ReactFlow
        elements={elements}
        onResize={onResize}
        onRotate={onRotate}
        onElementsRemove={onElementsRemove}
        onConnect={onConnect}
        deleteKeyCode={46}
        nodeTypes={{
          input: (props) => (
            <div>
              <div>{props.data.label}</div>
              <div>
                {" "}
                <img
                  ref={imageRef}
                  src={src}
                  alt="Image"
                  style={{
                    transform: `rotate(${rotation}deg) translateY(${yOffset}px)`,
                    position: "absolute",
                    zIndex: "2",
                  }}
                />
              </div>
            </div>
          ),
        }}
        reactFlowWrapper={reactFlowWrapper}
      >
        <Background color="#f0f0f0" gap={16} />
        <MiniMap />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default Overlay;
