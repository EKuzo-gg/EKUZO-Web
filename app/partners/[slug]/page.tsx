import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PartnerLanding from "@/components/partners/PartnerLanding";
import JsonLd from "@/components/JsonLd";
import { buildBreadcrumbSchema, buildFAQPageSchema } from "@/lib/schema";
import { getPartner, partnerList } from "@/lib/partners";

export function generateStaticParams() {
  return partnerList.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const partner = getPartner(slug);
  if (!partner) return {};

  const url = `https://ekuzo.gg/partners/${partner.slug}`;
  return {
    alternates: { canonical: `/partners/${partner.slug}` },
    title: partner.metaTitle,
    description: partner.metaDescription,
    openGraph: {
      title: partner.metaTitle,
      description: partner.metaDescription,
      url,
      type: "website",
      images: [
        {
          url: "https://ekuzo.gg/images/og-default.png",
          width: 1200,
          height: 630,
          alt: partner.metaTitle,
        },
      ],
    },
  };
}

export default async function PartnerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const partner = getPartner(slug);
  if (!partner) notFound();

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Partners", path: "/partners" },
    { name: partner.name, path: `/partners/${partner.slug}` },
  ]);
  const faqSchema = buildFAQPageSchema(partner.faqs);

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={faqSchema} />
      <PartnerLanding partner={partner} />
    </>
  );
}
