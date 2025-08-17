import { useState } from "react";
import { useTranslation } from "react-i18next";
import { createSelector } from "reselect";
import { useStore } from "@/store";
import type { Cycle } from "@/store/schemas/cycle.schema";
import { selectCyclesAndPacks } from "@/store/selectors/lists";
import { CYCLES_WITH_STANDALONE_PACKS } from "@/utils/constants";
import {
  CAMPAIGN_PLAYALONG_PROJECT_ID,
  campaignPlayalongPacks,
  currentEnvironmentPacks,
  limitedEnvironmentPacks,
} from "@/utils/environments";
import { capitalize, displayPackName } from "@/utils/formatting";
import { useAccentColor } from "@/utils/use-accent-color";
import { useResolvedDeck } from "@/utils/use-resolved-deck";
import { PackName } from "../pack-name";
import { Button } from "../ui/button";
import { Combobox } from "../ui/combobox/combobox";
import { useDialogContextChecked } from "../ui/dialog.hooks";
import { Field } from "../ui/field";
import {
  DefaultModalContent,
  Modal,
  ModalActions,
  ModalBackdrop,
  ModalInner,
} from "../ui/modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import css from "./limited-card-pool.module.css";

type Props = {
  onValueChange: (items: string[]) => void;
};

type TabProps = Props & {
  locale: string;
  dialogCtx: ReturnType<typeof useDialogContextChecked>;
};

const selectCampaignCycles = createSelector(selectCyclesAndPacks, (cycles) =>
  cycles.filter(
    (cycle) =>
      cycle.official !== false &&
      !CYCLES_WITH_STANDALONE_PACKS.includes(cycle.code),
  ),
);

const packRenderer = (cycle: Cycle) => (
  <PackName pack={cycle} shortenNewFormat />
);

const packToString = (pack: Cycle) => displayPackName(pack).toLowerCase();

export function ConfigureEnvironmentModal(props: Props) {
  const { onValueChange } = props;

  const { t } = useTranslation();

  const { resolvedDeck } = useResolvedDeck();
  const accentColor = useAccentColor(resolvedDeck?.cards.investigator.card);

  const dialogCtx = useDialogContextChecked();
  const [tab, setTab] = useState("legacy");

  const locale = useStore((state) => state.settings.locale);

  const tabProps = {
    locale,
    onValueChange,
    dialogCtx,
  };

  return (
    <Modal style={accentColor}>
      <ModalBackdrop />
      <ModalInner size="52rem">
        <ModalActions />
        <DefaultModalContent
          title={t("deck_edit.config.card_pool.configure_environment")}
        >
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <EnvironmentsTabTrigger value="legacy" />
              <EnvironmentsTabTrigger value="current" />
              <EnvironmentsTabTrigger value="limited" />
              <EnvironmentsTabTrigger value="campaign_playalong" />
            </TabsList>
            <EnvironmentsTabContent value="legacy">
              <LegacyTab {...tabProps} />
            </EnvironmentsTabContent>
            <EnvironmentsTabContent value="current">
              <CurrentTab {...tabProps} />
            </EnvironmentsTabContent>
            <EnvironmentsTabContent value="limited">
              <LimitedTab {...tabProps} />
            </EnvironmentsTabContent>
            <EnvironmentsTabContent value="campaign_playalong">
              <CampaignPlayalongTab {...tabProps} />
            </EnvironmentsTabContent>
          </Tabs>
        </DefaultModalContent>
      </ModalInner>
    </Modal>
  );
}

function LegacyTab({ dialogCtx, onValueChange }: TabProps) {
  return (
    <EnvironmentsTabConfirm
      environment="legacy"
      onClick={() => {
        onValueChange([]);
        dialogCtx.setOpen(false);
      }}
    />
  );
}

function CurrentTab({ dialogCtx, onValueChange }: TabProps) {
  const cycles = useStore(selectCampaignCycles);
  return (
    <EnvironmentsTabConfirm
      onClick={() => {
        onValueChange(currentEnvironmentPacks(cycles));
        dialogCtx.setOpen(false);
      }}
      environment="current"
    />
  );
}

function LimitedTab(props: TabProps) {
  const { dialogCtx, locale, onValueChange } = props;

  const { t } = useTranslation();

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const cycles = useStore(selectCampaignCycles);

  const applyEnvironment = () => {
    if (!selectedItems.length) return;

    const selectedCycles = selectedItems
      .map((code) => cycles.find((cycle) => cycle.code === code))
      .filter(Boolean) as Cycle[];

    const packs = limitedEnvironmentPacks(selectedCycles);

    onValueChange(packs);
    dialogCtx.setOpen(false);
  };

  return (
    <>
      <Field full padded bordered>
        <Combobox
          autoFocus
          id="cycle-select-combobox"
          limit={3}
          locale={locale}
          placeholder={t("deck_edit.config.card_pool.choose_cycle_placeholder")}
          renderItem={packRenderer}
          renderResult={packRenderer}
          itemToString={packToString}
          onValueChange={setSelectedItems}
          items={cycles}
          label={capitalize(t("common.cycle", { count: 3 }))}
          showLabel
          selectedItems={selectedItems}
        />
      </Field>
      <EnvironmentsTabConfirm
        disabled={!selectedItems.length}
        environment="limited"
        onClick={applyEnvironment}
      />
    </>
  );
}

function CampaignPlayalongTab(props: TabProps) {
  const { dialogCtx, locale, onValueChange } = props;

  const { t } = useTranslation();

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const cycles = useStore(selectCampaignCycles);

  const campaignPlayalongProject = useStore(
    (state) => state.fanMadeData.projects[CAMPAIGN_PLAYALONG_PROJECT_ID],
  );

  const applyEnvironment = () => {
    if (!selectedItems.length) return;
    const cycle = selectedItems[0];

    const packs = campaignPlayalongPacks(cycle);

    if (campaignPlayalongProject) {
      const packCodes = campaignPlayalongProject.data.packs.map(
        (pack) => pack.code,
      );

      packs.push(...packCodes);
    }

    onValueChange(packs);
    dialogCtx.setOpen(false);
  };

  return (
    <>
      <Field full padded bordered>
        <Combobox
          autoFocus
          id="cycle-select-combobox"
          limit={1}
          locale={locale}
          placeholder={t("deck_edit.config.card_pool.choose_cycle_placeholder")}
          renderItem={packRenderer}
          renderResult={packRenderer}
          itemToString={packToString}
          onValueChange={setSelectedItems}
          items={cycles}
          label={capitalize(t("common.cycle", { count: 1 }))}
          showLabel
          selectedItems={selectedItems}
        />
      </Field>
      <EnvironmentsTabConfirm
        disabled={!selectedItems.length}
        environment="campaign_playalong"
        onClick={applyEnvironment}
      />
    </>
  );
}

function EnvironmentsTabTrigger({ value }: { value: string }) {
  const { t } = useTranslation();
  return (
    <TabsTrigger
      value={value}
      data-testid={`limited-card-pool-environment-${value}`}
    >
      {t(`deck_edit.config.card_pool.${value}`)}
    </TabsTrigger>
  );
}

function EnvironmentsTabContent({
  children,
  value,
}: {
  children: React.ReactNode;
  value: string;
}) {
  const { t } = useTranslation();

  return (
    <TabsContent value={value}>
      <div className={css["environment-tab"]}>
        <div className="longform">
          <p>{t(`deck_edit.config.card_pool.${value}_help`)}</p>
        </div>
        {children}
      </div>
    </TabsContent>
  );
}

function EnvironmentsTabConfirm({
  environment,
  disabled = false,
  onClick,
}: {
  disabled?: boolean;
  environment: string;
  onClick: () => void;
}) {
  const { t } = useTranslation();

  return (
    <Button
      data-testid={`limited-card-pool-environment-${environment}-apply`}
      disabled={disabled}
      onClick={onClick}
      variant="primary"
    >
      {t("deck_edit.config.card_pool.apply", {
        environment: t(`deck_edit.config.card_pool.${environment}`),
      })}
    </Button>
  );
}
