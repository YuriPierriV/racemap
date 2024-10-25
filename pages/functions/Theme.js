export const applyTheme = () => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
      return savedTheme; // Retorna o tema salvo
    }
    return "light"; // Retorna "light" se nenhum tema estiver salvo
};
  // Função para alternar o tema
export const toggleTheme = (currentTheme) => {
    const newTheme = currentTheme === "light" ? "dark" : "light";
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
    return newTheme; // Retorna o novo tema
};