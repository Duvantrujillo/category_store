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
          Buscar variantes
        </CardTitle>

        <CardDescription>
          Busca por SKU, código de barras o atributos de la variante.
        </CardDescription>

      </CardHeader>

      <CardContent>

        <InputGroup>

          <InputGroupInput
            value={query}
            onChange={(e) =>
              setQuery(e.target.value)
            }
            placeholder="Ej: Adidas, Zapatos, Negro..."
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