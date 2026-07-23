import { FormCard, StyledCheckbox } from "./FormControls";
import type { FormState, UpdateForm } from "../formState";

interface MiddlewareConfigSectionProps {
  config: FormState;
  update: UpdateForm;
}

export const MiddlewareConfigSection = ({
  config,
  update,
}: MiddlewareConfigSectionProps) => (
  <FormCard title="Security & Logging Middleware" gap={1.5}>
    <StyledCheckbox
      label="Enable Pino Logger"
      checked={config.usePinoLogger}
      onChange={(val) => update({ usePinoLogger: val })}
    />
    <StyledCheckbox
      label="Enable Helmet (HTTP Header Security)"
      checked={config.useHelmet}
      onChange={(val) => update({ useHelmet: val })}
    />
    <StyledCheckbox
      label="Enable Rate Limiting protection"
      checked={config.useRateLimiting}
      onChange={(val) => update({ useRateLimiting: val })}
    />
  </FormCard>
);
