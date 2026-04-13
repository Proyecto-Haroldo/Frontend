import { useEffect, useState } from "react";
import { defaultCategories } from "../../../public/assets/Categories";
import { ICategory } from "../../core/models/questionnaire";
import { publicCategories } from "../../api/authApi";

const useCategories = () => {
    const [categories, setCategories] = useState<ICategory[]>(defaultCategories);
    const [isUsingFallback, setIsUsingFallback] = useState(true);

    useEffect(() => {
        let isMounted = true;

        publicCategories()
            .then((data) => {
                if (!isMounted) return;

                if (Array.isArray(data) && data.length > 0) {
                    const normalized = data.map((c: ICategory) => ({
                        ...c,
                        id: Number(c.id),
                        name: c.name?.trim(),
                        description: c.description?.trim(),
                    }));

                    setCategories(normalized);
                    setIsUsingFallback(false);
                } else {
                    setCategories(defaultCategories);
                    setIsUsingFallback(true);
                }
            })
            .catch(() => {
                if (!isMounted) return;
                setCategories(defaultCategories);
                setIsUsingFallback(true);
            });

        return () => {
            isMounted = false;
        };
    }, []);

    return { categories, isUsingFallback };
};

export default useCategories;