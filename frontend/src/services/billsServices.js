export const getBills = async() => {
  const response = await fetch('http://localhost:8080/api/bills');
  return await response.json();
}