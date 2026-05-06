import { LoaderCircleIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Plane } from "@/components/ui/plane";
import { Tag } from "@/components/ui/tag";
import { useCardFaqQuery } from "@/queries/grimoire";
import { parseCardTextHtml } from "@/utils/card-utils";
import css from "./card-faq.module.css";

type Props = {
  code: string;
};

export function CardFaq(props: Props) {
  const { code } = props;
  const { t } = useTranslation();
  const faq = useCardFaqQuery(code);

  return (
    <Plane as="section" className={css["container"]}>
      <h3 className={css["title"]}>{t("card_view.faq.title")}</h3>

      {faq.isPending && (
        <output className={css["status"]}>
          <LoaderCircleIcon className="spin" />
        </output>
      )}

      {faq.error && (
        <output className={css["status"]}>{t("card_view.faq.error")}</output>
      )}

      {faq.data?.length === 0 && (
        <output className={css["status"]}>{t("card_view.faq.empty")}</output>
      )}

      {!!faq.data?.length && (
        <ul className={css["list"]}>
          {faq.data.map((item) => (
            <li key={item.id}>
              <p
                className={css["question"]}
                // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML is from trusted source.
                dangerouslySetInnerHTML={{
                  __html: parseCardTextHtml(item.question),
                }}
              />
              <p
                // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML is from trusted source.
                dangerouslySetInnerHTML={{
                  __html: parseCardTextHtml(item.ruling),
                }}
              />
              <p>
                <Tag size="sm">{item.citation}</Tag>
              </p>
            </li>
          ))}
        </ul>
      )}
    </Plane>
  );
}
