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

function ProductSearch({
  query,
  setQuery,
  resultsCount,
}) {
  return (
    <Card className="mt-4 max-w-2xl">

      <CardHeader>

        <CardTitle>
          Buscar productos
        </CardTitle>

        <CardDescription>
          Busca por nombre, slug, categoría o marca.
        </CardDescription>

      </CardHeader>

      <CardContent>

        <InputGroup>

          <InputGroupInput
            value={query}
            onChange={(e) =>
              setQuery(e.target.value)
            }
            placeholder="Ej: Adidas, Camiseta Deportiva, Nike, Calzado..."
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

export default ProductSearch;