import { Job } from '@circleci/circleci-config-sdk';
import ReactFlow, {
  Background,
  BackgroundVariant,
  FlowTransform,
  isNode,
  Node,
  NodeTypesType,
} from 'react-flow-renderer';
import { v4 } from 'uuid';
import { dataMappings } from '../../mappings/ComponentMapping';
import { WorkflowJob } from '../../mappings/JobMapping';
import { useStoreActions, useStoreState } from '../../state/Hooks';
import { WorkflowModel } from '../../state/Store';

export interface ElementProps {
  className?: string;
  bgClassName?: string;
  workflow: WorkflowModel;
}

const getTypes = (): NodeTypesType =>
  Object.assign(
    {},
    ...dataMappings.map((component) => {
      const node = component.dataType.node;

      if (node) {
        return { [node.type]: node.component };
      }

      return null;
    }),
  );

const WorkflowPane = (props: ElementProps) => {
  const elements = useStoreState(
    (state) => state.workflows[state.selectedWorkflow].elements,
  );
  const addWorkflowElement = useStoreActions(
    (actions) => actions.addWorkflowElement,
  );
  let curTransform: FlowTransform = { x: 0, y: 0, zoom: 1 };

  const updateLocation = (transform?: FlowTransform) => {
    if (transform) {
      curTransform = transform;
    }
  };

  const gap = 15;

  return (
    <div
      className="w-full h-full"
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes('workflow')) {
          e.preventDefault();
        }
      }}
      onDrop={(e) => {
        if (e.dataTransfer.types.includes('workflow')) {
          const transfer = JSON.parse(e.dataTransfer.getData('workflow'));
          console.log(
            "e.dataTransfer.getData('workflow') = " +
              e.dataTransfer.getData('workflow'),
          );

          const indexsTaken: { [key: number]: boolean } = {};
          const fullName = (transfer.data.parameters?.name || transfer.data.job.name);
          const rawName = fullName.replace(/\d+$/, "");
          const nameSuffixNum = fullName.replace(/\D/g, '');

            console.log("full name= " +fullName);
            console.log("rawName= " +rawName) ;
            console.log("indexsTaken= " +indexsTaken) ;
            console.log("nameSuffixNum= " +nameSuffixNum);

          var elementnames = elements.forEach((element) => {
            if (isNode(element) && element.data && element.type === 'job') {
              const jobName: string = (
                element.data.parameters?.name || element.data.job.name
              ).trim();
              console.log("jobName= " +jobName) ;
              const matches = jobName.match(
                `^${rawName}($|\\d+$)`,
              );
              console.log(matches)
              if (matches) {
                indexsTaken[matches[1] === '' ? 0 : Number(matches[1].trim())] = true; 
              }
            }
          });

          const foundIndexes = Object.keys(indexsTaken);
          let freeIndex: number | undefined = undefined;
          let newName = fullName;

          if (foundIndexes.length > 0) {
            foundIndexes.forEach((value, index) => {
              if (Number(value) !== index) {
                freeIndex = index;
              }

              console.log(`${freeIndex} - value: ${value}, index: ${index}`)
            })

            console.log("found Index= " + foundIndexes, "free index= "+freeIndex)

            if (freeIndex === undefined) { 
              newName = `${rawName} ${foundIndexes.length}`
            } else {
              newName = `${rawName} ${parseInt(nameSuffixNum)+1}`
            }
          }

          console.log(`Old name: ${fullName} New Name: ${newName}`)

          const pos = {
            x: e.clientX - gap - curTransform.x,
            y: e.clientY - gap * 3 - curTransform.y,
          };
          const round = (val: number) =>
            (Math.floor(val / gap) * gap) / curTransform.zoom;

          if (transfer) {
            const workflowNode: Node<any> = {
              data: transfer.data,
              connectable: true,
              type: transfer.type,
              id: v4(),
              position: { x: round(pos.x), y: round(pos.y) },
            };

            addWorkflowElement(workflowNode);
          }
        }

        console.log("names"+elementnames)
        

      }}

    >
      <ReactFlow
        elements={elements}
        className={props.className}
        onMove={updateLocation}
        selectNodesOnDrag={false}
        nodeTypes={getTypes()}
        snapToGrid={true}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={gap}
          color="#A3A3A3"
          className={props.bgClassName}
          size={1}
        />
      </ReactFlow>
    </div>
  );
};

export default WorkflowPane;
