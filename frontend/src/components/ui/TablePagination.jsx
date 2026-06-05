import { useMemo } from "react";

import { cn } from "@/lib/utils";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

function TablePagination({ page, pageSize, totalItems, onPageChange, className }) {
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

    const pages = useMemo(
        () => Array.from({ length: totalPages }, (_, index) => index + 1),
        [totalPages]
    );

    if (totalPages <= 1) {
        return null;
    }

    return (
        <div className={cn("flex flex-col items-center justify-between gap-2 sm:flex-row", className)}>
            <p className="text-sm text-muted-foreground">
                Página {page} de {totalPages}
            </p>

            <Pagination aria-label="Pagination navigation">
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            disabled={page === 1}
                            onClick={(e) => {
                                e.preventDefault();
                                if (page > 1) onPageChange(page - 1);
                            }}
                        />
                    </PaginationItem>

                    {pages.map((pageNumber) => (
                        <PaginationItem key={pageNumber}>
                            <PaginationLink
                                isActive={pageNumber === page}
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (pageNumber !== page) onPageChange(pageNumber);
                                }}
                            >
                                {pageNumber}
                            </PaginationLink>
                        </PaginationItem>
                    ))}

                    <PaginationItem>
                        <PaginationNext
                            disabled={page === totalPages}
                            onClick={(e) => {
                                e.preventDefault();
                                if (page < totalPages) onPageChange(page + 1);
                            }}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
}

export default TablePagination;
