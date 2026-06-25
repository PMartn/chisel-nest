
import { FormCard, StyledCheckbox } from "./FormControls";

interface MiddlewareConfigSectionProps {
  usePinoLogger: boolean;
  setUsePinoLogger: (val: boolean) => void;
  useHelmet: boolean;
  setUseHelmet: (val: boolean) => void;
  useRateLimiting: boolean;
  setUseRateLimiting: (val: boolean) => void;
}

export const MiddlewareConfigSection = ({
  usePinoLogger,
  setUsePinoLogger,
  useHelmet,
  setUseHelmet,
  useRateLimiting,
  setUseRateLimiting,
}: MiddlewareConfigSectionProps) => (
  <FormCard title="Security & Logging Middleware" gap={1.5}>
    <StyledCheckbox
      label="Enable Pino Logger"
      checked={usePinoLogger}
      onChange={setUsePinoLogger}
    />
    <StyledCheckbox
      label="Enable Helmet (HTTP Header Security)"
      checked={useHelmet}
      onChange={setUseHelmet}
    />
    <StyledCheckbox
      label="Enable Rate Limiting protection"
      checked={useRateLimiting}
      onChange={setUseRateLimiting}
    />
  </FormCard>
);
