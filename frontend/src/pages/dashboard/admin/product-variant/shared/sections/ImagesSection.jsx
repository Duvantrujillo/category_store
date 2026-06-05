import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useDropzone } from "react-dropzone";

export default function ImagesSection({
    form,
    handleChange,
}) {

    const removeMainImage = () => {
        handleChange("mainImage", null);
    };

    const removeGalleryImage = (index) => {

        const newImages = [...(form.images || [])];

        newImages.splice(index, 1);

        handleChange(
            "images",
            newImages
        );

    };

    const {
        getRootProps,
        getInputProps,
    } = useDropzone({
        accept: {
            "image/*": [],
        },
        maxFiles: 5,
        onDrop: (acceptedFiles) => {

            if (!acceptedFiles.length) return;

            let mainImage = form.mainImage;
            let galleryImages = [...(form.images || [])];

            acceptedFiles.forEach((file) => {

                if (!mainImage) {

                    mainImage = file;

                    return;

                }

                // colocar el archivo en la primera ranura vacía si existe
                const emptyIndex = galleryImages.findIndex((i) => !i);

                if (emptyIndex !== -1) {

                    galleryImages[emptyIndex] = file;

                    return;

                }

                // si no hay ranuras vacías, añadir al final si aún hay espacio
                if (galleryImages.filter(Boolean).length < 4) {

                    galleryImages.push(file);

                }

            });

            handleChange(
                "mainImage",
                mainImage
            );

            handleChange(
                "images",
                galleryImages.slice(0, 4)
            );

        },
    });

    return (
        <div className="space-y-6">

            {/* PREVIEWS */}
            <div>

                <Label className="mb-3 block">
                    Imágenes del producto
                </Label>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">

                    {/* PRINCIPAL */}
                    <div>

                        <p className="text-xs font-medium mb-2 text-center">
                            Principal
                        </p>

                        <div className="relative aspect-square rounded-xl border overflow-hidden bg-muted">

                            {form.mainImage ? (

                                <>
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="destructive"
                                        className="
                                            absolute
                                            top-2
                                            right-2
                                            z-10
                                            h-7
                                            w-7
                                        "
                                        onClick={removeMainImage}
                                    >
                                        ×
                                    </Button>

                                    <img
                                        src={
                                            form.mainImage instanceof File
                                                ? URL.createObjectURL(
                                                    form.mainImage
                                                )
                                                : `${import.meta.env.VITE_API_URL}${form.mainImage}`
                                        }
                                        alt="principal"
                                        className="
                                            h-full
                                            w-full
                                            object-cover
                                        "
                                    />
                                </>

                            ) : (

                                <div className="
                                    h-full
                                    w-full
                                    flex
                                    items-center
                                    justify-center
                                    text-4xl
                                    text-muted-foreground
                                ">
                                    +
                                </div>

                            )}

                        </div>

                    </div>

                    {/* GALERÍA */}
                    {[0, 1, 2, 3].map((index) => {

                        const image =
                            form.images?.[index];

                        return (

                            <div key={index}>

                                <p className="text-xs font-medium mb-2 text-center">
                                    Galería {index + 1}
                                </p>

                                <div className="
                                    relative
                                    aspect-square
                                    rounded-xl
                                    border
                                    overflow-hidden
                                    bg-muted
                                ">

                                    {image ? (

                                        <>
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="destructive"
                                                className="
                                                    absolute
                                                    top-2
                                                    right-2
                                                    z-10
                                                    h-7
                                                    w-7
                                                "
                                                onClick={() =>
                                                    removeGalleryImage(
                                                        index
                                                    )
                                                }
                                            >
                                                ×
                                            </Button>

                                            <img
                                                src={
                                                    image instanceof File
                                                        ? URL.createObjectURL(
                                                            image
                                                        )
                                                        : `${import.meta.env.VITE_API_URL}${image}`
                                                }
                                                alt={`gallery-${index}`}
                                                className="
                                                    h-full
                                                    w-full
                                                    object-cover
                                                "
                                            />
                                        </>

                                    ) : (

                                        <div className="
                                            h-full
                                            w-full
                                            flex
                                            items-center
                                            justify-center
                                            text-4xl
                                            text-muted-foreground
                                        ">
                                            +
                                        </div>

                                    )}

                                </div>

                            </div>

                        );

                    })}

                </div>

            </div>

            {/* DROPZONE */}
            <div>

                <div
                    {...getRootProps()}
                    className="
                        border-2
                        border-dashed
                        rounded-xl
                        p-8
                        text-center
                        cursor-pointer
                        transition-colors
                        hover:bg-muted/50
                    "
                >

                    <input {...getInputProps()} />

                    <div className="space-y-2">

                        <p className="font-medium">
                            Arrastra imágenes aquí
                        </p>

                        <p className="text-sm text-muted-foreground">
                            Principal + 4 imágenes de galería
                        </p>

                    </div>

                </div>

            </div>

        </div>
    );
}