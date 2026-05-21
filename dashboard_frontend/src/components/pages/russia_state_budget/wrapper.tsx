import { useGetPageDataQuery } from "@/store/api/pageData";

interface Props {
  Content: React.ComponentType<{ data: unknown }>;
}

export default function PageWrapper({ Content }: Props) {
  const { data, isLoading, error } = useGetPageDataQuery("russia_state_budget");

  if (isLoading) {
    return <p className="text-muted-foreground">Loading data...</p>;
  }

  if (error) {
    return (
      <p className="text-destructive">
        Failed to load data for this page.
      </p>
    );
  }

  return <Content data={data} />;
}
