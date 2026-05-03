export const autoGrow = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const el = e.target;
    console.log("Размер поля для записи увеличен до ", getComputedStyle(el).lineHeight)
    el.style.height = "0px";
    el.style.height = `${el.scrollHeight}px`;
};

