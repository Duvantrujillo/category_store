import { Search } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

function ProductVariantSearch({
  query,
  setQuery,
  resultsCount,
}) {
  return (
    <Card className="mt-4 max-w-2xl">

      <CardHeader>

        <CardTitle>
          Buscar marcas
        </CardTitle>

        <CardDescription>
          Busca marcas por nombre o slug.
        </CardDescription>

      </CardHeader>

      <CardContent>

        <InputGroup>

          <InputGroupInput
            value={query}
            onChange={(e) =>
              setQuery(e.target.value)
            }
            placeholder="Ej: Adidas, Nike, Puma..."
          />

          <InputGroupAddon>
            <Search size={18} />
          </InputGroupAddon>

          <InputGroupAddon align="inline-end">
            {resultsCount}
          </InputGroupAddon>

        </InputGroup>

      </CardContent>

    </Card>
  );
}

export default ProductVariantSearch;