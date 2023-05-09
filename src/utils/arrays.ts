/**
 * 找到数组中第一个缺失的正整数
 * @param nums 数组
 * @returns 第一个缺失的正整数
 */
export const findFirstMissingPositive = (nums: number[]) => {
  const n = nums.length
  for (let i = 0; i < n; ++i) {
    if (nums[i] <= 0) {
      nums[i] = n + 1
    }
  }
  for (let i = 0; i < n; ++i) {
    const num = Math.abs(nums[i])
    if (num <= n) {
      nums[num - 1] = -Math.abs(nums[num - 1])
    }
  }
  for (let i = 0; i < n; ++i) {
    if (nums[i] > 0) {
      return i + 1
    }
  }
  return n + 1
}

// function testPerformance(func) {
//   const iterations = 100000 // 测试次数
//   let totalTime = 0
//   for (let i = 0; i < iterations; i++) {
//     const startTime = performance.now()
//     func()
//     const endTime = performance.now()
//     totalTime += endTime - startTime
//   }
//   const averageTime = totalTime / iterations
//   console.log(`平均执行时间：${averageTime.toFixed(4)} 毫秒`)
// }
