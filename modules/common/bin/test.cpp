#include <iostream>

using namespace std;

int main(void)
{
  int sum = 0;

  for (int i = 0; i < 100; i++)
  {
    sum += i;
  }

  cout << sum;

  fflush(stdout);
  return 0;
}