import { commands } from '@circleci/circleci-config-sdk';
import { CustomCommand } from '@circleci/circleci-config-sdk/dist/src/lib/Components/Commands/exports/Reusable';
import CommandSummary from '../components/atoms/summaries/CommandSummary';
import CommandInspector from '../components/containers/inspector/CommandInspector';
import { componentParametersSubtypes } from '../components/containers/inspector/subtypes/ParameterSubtypes';
import CommandIcon from '../icons/components/CommandIcon';
import ComponentMapping from './ComponentMapping';

const CommandMapping: ComponentMapping<CustomCommand> = {
  type: 'commands',
  name: {
    singular: 'Command',
    plural: 'Commands',
  },
  defaults: {
    name: 'new-command',
    steps: [],
  },
  parameters: componentParametersSubtypes.command,
  transform: (values: any) =>
    new commands.reusable.CustomCommand(
      values.name,
      values.steps,
      values.parameters,
    ),
  store: {
    get: (state) => state.definitions.commands,
    add: (actions) => actions.defineCommand,
    update: (actions) => actions.updateCommand,
    remove: (actions) => actions.undefineCommand,
  },
  components: {
    icon: CommandIcon,
    summary: CommandSummary,
    inspector: CommandInspector,
  },
};

export default CommandMapping;
